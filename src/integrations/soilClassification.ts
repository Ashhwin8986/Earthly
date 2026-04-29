export const classifySoil = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:5001/predict-soil", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Soil classification failed");
  }

  return response.json();
};
