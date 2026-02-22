import pathlib

content = 'import { getAdmins } from "./actions";\nimport AdminsClient from "./_components/AdminsClient";\n\nexport default async function ReglagesPage() {\n  const { data: admins = [], error } = await getAdmins();\n  return <AdminsClient initialAdmins={admins} fetchError={error} />;\n}\n'

p = pathlib.Path('C:/Users/Tychique Mpukuta/Downloads/SaasCandy-Nextjs-Tailwind-main/SaasCandy-Nextjs-Tailwind-main/package/src/app/(backoffice)/reglages/page.tsx')
p.write_text(content, encoding='utf-8')
print('Written', len(content), 'chars')
