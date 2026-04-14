export const validateImage = (file) => {
    if (!file) return false;
    
    if (file.size > 2000000) {
        alert("File is too big! Please select an image under 2MB.");
        return false;
    }
    return true;
};