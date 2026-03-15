import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: any) {

  return (

    <div className="flex bg-[#020617] text-white">

      <AdminSidebar />

      <div className="flex-1 p-10">
        {children}
      </div>

    </div>

  );
}