
const baseUrl = import.meta.env.VITE_API_URL;
export async function fillForm(formType) {
  const url = `${baseUrl}/api/forms/fill/${formType}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fill form');
    }
    return await response.json();
  } catch (error) {
    return { message: error.message, files: [] };
  }
}
