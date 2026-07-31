import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function AdminClienteDetailPage({ params }: Props) {
  const { clientId } = await params;
  redirect(`/admin/clientes/${clientId}/editar`);
}
