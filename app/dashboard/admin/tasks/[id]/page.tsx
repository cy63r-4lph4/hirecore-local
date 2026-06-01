import TaskDetailAdminClient from "./task-detail-client";

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TaskDetailAdminClient taskId={id} />;
}