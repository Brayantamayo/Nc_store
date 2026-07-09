export async function deleteMany<T>(
  ids: T[],
  deleteFn: (id: T) => Promise<void>
): Promise<{ succeeded: number; failed: number }> {
  const results = await Promise.allSettled(ids.map((id) => deleteFn(id)));
  const failed = results.filter((result) => result.status === 'rejected').length;
  return { succeeded: ids.length - failed, failed };
}
