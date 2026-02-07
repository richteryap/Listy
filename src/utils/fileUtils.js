export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const validateImage = (file) => {
    if (!file) return false;
    if (file.size > 500000) {
        alert("File is too big! Please select an image under 500KB.");
        return false;
    }
    return true;
};