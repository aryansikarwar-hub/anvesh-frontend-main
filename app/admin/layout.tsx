import AdminLayout from '@/admin/layout';

export default function AdminRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
