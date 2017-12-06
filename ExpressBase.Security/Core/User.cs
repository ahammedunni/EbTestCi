using System;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using ExpressBase.Common;
using ExpressBase.Data;
using Npgsql;
using System.Data.Common;
using MimeKit;
using MailKit.Net.Smtp;
using System.Collections.Generic;
using System.Runtime.Serialization;
using MailKit.Security;
using System.IO;
using ServiceStack.Auth;
using ExpressBase.Security.Core;
using ExpressBase.Common.Extensions;
using System.Linq;

namespace ExpressBase.Security
{
    [DataContract]
    public class User : UserAuth
    {
        [DataMember(Order = 1)]
        public string Proimg { get; set; }

        [DataMember(Order = 2)]
        public override List<string> Roles { get; set; }

        [DataMember(Order = 3)]
        public override List<string> Permissions { get; set; }

        [DataMember(Order = 4)]
        public int loginattempts;

        [DataMember(Order = 5)]
        public string CId { get; set; }

        [DataMember(Order = 6)]
        public int  UserId { get; set; }

        [DataMember(Order = 7)]
        public string wc { get; set; }

        [DataMember(Order = 8)]
        public string Prolink { get; set; }

        private List<string> _ebObjectIds = null;
        public List<string> EbObjectIds
        {
            get
            {
                if (_ebObjectIds == null)
                {
                    _ebObjectIds = new List<string>();
                    this.PopulateEbObjectIds();
                }

                return _ebObjectIds;
            }
        }

        private void PopulateEbObjectIds()
        {
            foreach (string p in this.Permissions)
            {
                string oId = p.Split("_")[0].Trim();
                if (!this.EbObjectIds.Contains(oId))
                    this.EbObjectIds.Add(oId);
            }
        }

        public User(int id, string uname, string fname,string proimg, string prolink,List<string> roles, List<string> permissions)
        {
            this.Email = uname;
            this.UserId = id;
            this.Proimg = proimg;
            this.Prolink = prolink;
            this.Roles = roles ?? new List<string>();
            this.Permissions = permissions ?? new List<string>();
        }

        public User(int id, string uname, string fname, string profileimg, List<string> roles, List<string> permissions)
        {
            this.Email = uname;
            this.UserId = id;
            this.FirstName = fname;
            this.Proimg = profileimg;
            this.Roles = roles ?? new List<string>();
            this.Permissions = permissions ?? new List<string>();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="emailaddress"></param>
        /// <returns>bool</returns>
        public static bool IsValidmail(string emailaddress)
        {
            //  return true;
            return (Regex.IsMatch(emailaddress, @"\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\Z", RegexOptions.IgnoreCase));
        }

        public static bool Isvalidpassword(string password)
        {
            var input = password;

            var hasPassword = new Regex(@"^(?=.*[0-9])^(?=.*[a-zA-Z])^(?=.*[!#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,}");
            var isValidated = hasPassword.IsMatch(input);
            return isValidated;
        }

        public bool HasEbSystemRole()
        {
            var Enumvalues = Enum.GetValues(typeof(EbSystemRoles));
            foreach (var role in Enumvalues)
            {
                if (this.Roles.Contains(role.ToString()))
                    return true;
            }

            return false;
        }
        public bool HasSystemRole()
        {
            var Enumvalues = Enum.GetValues(typeof(SystemRoles));
            foreach (var role in Enumvalues)
            {
                if (this.Roles.Contains(role.ToString()))
                    return true;
            }

            return false;
        }

        public bool HasRole(string role)
        {
            return this.Roles.Contains(role);
        }

        public bool HasPermission(string permission)
        {
            return this.Permissions.Contains(permission);
        }    

        //public static User GetInfraUser(IDatabase db, string uname, string pass)
        //{
        //    User _user = null;

        //    string sql = "UPDATE eb_tenants SET loginattempts = loginattempts + 1 WHERE cname = @cname AND password = @password;";
        //         sql +="SELECT id, firstname, profileimg,loginattempts FROM eb_tenants WHERE cname = @cname AND password = @password AND isverified = TRUE";

        //    DbParameter[] parameters = {
        //        db.GetNewParameter("cname", System.Data.DbType.String, uname),
        //        db.GetNewParameter("password", System.Data.DbType.String, pass)
        //    };

        //    EbDataTable dt = db.DoQuery(sql, parameters);

        //    if (dt.Rows.Count != 0)
        //    {
        //        _user = new User(Convert.ToInt32(dt.Rows[0][0]), uname, dt.Rows[0][1].ToString(), dt.Rows[0][2].ToString());
        //        _user.loginattempts = Convert.ToInt32(dt.Rows[0][3]);
        //    }        

        //    return _user;
        //}

        public static User GetInfraUserViaSocial(IDatabase db, string socialId)
        {
            User _user = null;

            string sql = "SELECT * FROM eb_authenticateuser(@uname,@pass,@social);";

            DbParameter[] parameters = { db.GetNewParameter("@uname", DbType.String, string.Empty), db.GetNewParameter("@pass", DbType.String, string.Empty), db.GetNewParameter("social", System.Data.DbType.String, socialId) };         

            EbDataTable ds = db.DoQuery(sql, parameters);
           
            if (ds.Rows.Count > 0)
            {
                int userid = Convert.ToInt32(ds.Rows[0][0]);
                if (userid > 0)
                {
                    _user = new User(userid, ds.Rows[0][1].ToString(), ds.Rows[0][2].ToString(), ds.Rows[0][3].ToString(), ds.Rows[0][4].ToString(), ds.Rows[0][6].ToString().Split(',').ToList(), ds.Rows[0][7].ToString().Split(',').ToList());
                    _user.loginattempts = Convert.ToInt32(ds.Rows[0][8]);
                }

            }
            return _user;
        }

        public static User GetInfraVerifiedUser(IDatabase db, string uname, string u_token)
        {
            User _user = null;
            string sql = "UPDATE eb_tenants SET isverified = TRUE WHERE cname = @cname AND u_token = @u_token;";
            sql += "SELECT id, firstname,profileimg FROM eb_tenants WHERE cname = @cname AND u_token = @u_token";

            DbParameter[] parameters = {
                db.GetNewParameter("cname", System.Data.DbType.String, uname),
                db.GetNewParameter("u_token", System.Data.DbType.String, u_token)
            };

            EbDataTable dt = db.DoQuery(sql, parameters);

            if (dt.Rows.Count != 0)
                _user = new User(Convert.ToInt32(dt.Rows[0][0]), uname, dt.Rows[0][1].ToString(), dt.Rows[0][2].ToString(),null,null);

            return _user;
        }

        public static User GetDetails(IDatabase df, string uname, string pass)
        {
          //  string MD5Pass = (pass + uname).ToMD5Hash();

            string sql = @"UPDATE eb_users SET loginattempts = loginattempts + 1 WHERE email = @uname AND pwd = @pass;
                           SELECT * FROM eb_authenticateuser(@uname,@pass,@social);";

            DbParameter[] parameters = { df.GetNewParameter("@uname", DbType.String, uname), df.GetNewParameter("@pass", DbType.String, pass), df.GetNewParameter("@social", DbType.String, string.Empty) };
            var ds = df.DoQuery(sql, parameters);

            User _user = null;
            if (ds.Rows.Count > 0)
            {
                int userid = Convert.ToInt32(ds.Rows[0][0]);
                if (userid > 0)
                {
                    _user = new User(userid, ds.Rows[0][1].ToString(), ds.Rows[0][2].ToString(), ds.Rows[0][3].ToString(), ds.Rows[0][4].ToString(), ds.Rows[0][6].ToString().Split(',').ToList(), ds.Rows[0][7].ToString().Split(',').ToList());
                    _user.loginattempts = Convert.ToInt32(ds.Rows[0][8]);
                }
                   
            }
            return _user;
        }
    }
}

