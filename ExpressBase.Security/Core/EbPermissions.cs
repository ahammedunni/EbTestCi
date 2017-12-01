using System;
using System.Collections.Generic;
using System.Text;

namespace ExpressBase.Security.Core
{
    public class EbPermissions
    {
        public int _id { get; set; }

        public int _object_id { get; set; }

        public int _operation_id { get; set; }

        public string _permissionname { get; set; }

        public EbPermissions(int id, int object_id, int operation_id)
        {
            this._id = id;
            this._object_id = object_id;
            this._operation_id = operation_id;
        }

    }
    public class PermissionCollection : List<EbPermissions>
    {
        new public void Add(EbPermissions p)                                      //to add  new permissions into permission collection
        {
            if (!this.Contains(p))
                base.Add(p);
            else
                throw new PermissionAlreadyFoundInCollectionException();
        }

        new public void Remove(EbPermissions p)                                   //to delete  a permission from permission collection
        {
            if (this.Contains(p))
                base.Remove(p);
            else
                throw new PermissionNotFoundInCollectionException();
        }

        private class PermissionAlreadyFoundInCollectionException : Exception
        {
            public PermissionAlreadyFoundInCollectionException()
            {
            }

            public PermissionAlreadyFoundInCollectionException(string message) : base(message)
            {
            }

            public PermissionAlreadyFoundInCollectionException(string message, Exception innerException) : base(message, innerException)
            {
            }
        }

        private class PermissionNotFoundInCollectionException : Exception
        {
            public PermissionNotFoundInCollectionException()
            {
            }

            public PermissionNotFoundInCollectionException(string message) : base(message)
            {
            }

            public PermissionNotFoundInCollectionException(string message, Exception innerException) : base(message, innerException)
            {
            }
        }
    }
}
