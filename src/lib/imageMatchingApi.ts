
export async function matchImages(lost: File, found: File) {
  const formData = new FormData();
  formData.append("lost", lost);
  formData.append("found", found);

  const res = await fetch("http://localhost:5000/match", {
    method: "POST",
    body: formData,
  });

  return res.json();
}
