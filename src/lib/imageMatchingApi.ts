
export async function matchImages(lost: File, found: File) {
  const formData = new FormData();
  formData.append("lost", lost);
  formData.append("found", found);

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/match`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}
