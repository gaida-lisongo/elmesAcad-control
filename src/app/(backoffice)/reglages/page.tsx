import { getAdmins } from "./actions";
import AdminsClient from "./_components/AdminsClient";

export default async function ReglagesPage() {
  const { data: admins = [], error } = await getAdmins();
  return <AdminsClient initialAdmins={admins} fetchError={error} />;
}
