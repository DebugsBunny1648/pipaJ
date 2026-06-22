import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers(r.data)); }, []);

  return (
    <div data-testid="admin-users">
      <h2 className="font-serif-pipa text-3xl mb-5">Users</h2>
      <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F3EFE9]">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[#E5E0D8]" data-testid={`user-${u.id}`}>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className="text-xs uppercase tracking-widest bg-[#F3EFE9] px-2 py-1">{u.role}</span></td>
                <td className="p-3 text-xs">{u.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
