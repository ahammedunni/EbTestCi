using ExpressBase.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace ExpressBase.Security.Core
{
    public class EbRole
    {
        public int _id { get; set; }
        public string _name { get; set; }

        public RoleCollection RoleCollection { get;  set; }

        public PermissionCollection PermissionCollection { get; set; }

        public EbRole(int id, string name)
        {
            this._id = id;
            this._name = name;
            this.PermissionCollection = new PermissionCollection();
            this.RoleCollection = new RoleCollection();
        }

        ~EbRole()
        {
            this.PermissionCollection.Clear();
            this.PermissionCollection = null;
            this.RoleCollection.Clear();
            this.RoleCollection = null;


        }
    }

    public class RoleCollection : List<EbRole>
    {
        new public void Add(EbRole r)
        {
            if (!this.Contains(r))
            {
                try
                {
                    base.Add(r);
                }
                catch
                {

                }

            }

            else
                throw new RoleAlreadyFoundInRoleCollectonException();
        }

        new public void Remove(EbRole r)
        {
            if (this.Contains(r))
            {
                base.Remove(r);
            }
            else
                throw new RoleNotFoundInRoleCollectionException();
        }
    

        public bool HasSystemRole()
        {
            foreach (var Role in this)
            {
                if (HasRole(Role._id))
                {
                    return true;
                }
            }
            return false;

        }

        public bool HasRole(int role_id)
        {
            var Enumvalues = Enum.GetValues(typeof(SystemRoles));
            foreach (var value in Enumvalues)
            {
                if (role_id == (int)value)
                {
                    return true;
                }
            }
            return false;
        }
    }

    internal class RoleNotFoundInRoleCollectionException : Exception
    {
        public RoleNotFoundInRoleCollectionException()
        {
        }

        public RoleNotFoundInRoleCollectionException(string message) : base(message)
        {
        }

        public RoleNotFoundInRoleCollectionException(string message, Exception innerException) : base(message, innerException)
        {
        }


    }

    internal class RoleAlreadyFoundInRoleCollectonException : Exception
    {
        public RoleAlreadyFoundInRoleCollectonException()
        {
        }

        public RoleAlreadyFoundInRoleCollectonException(string message) : base(message)
        {
        }

        public RoleAlreadyFoundInRoleCollectonException(string message, Exception innerException) : base(message, innerException)
        {
        }


    }
}
