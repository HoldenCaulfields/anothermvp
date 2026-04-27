export async function uploadToCloudinary(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "sinhviennet");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dgmvr9lnh/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error("Upload failed");

  return data.secure_url;
}
