// utils/imageUpload.utils.js

/**
 * Upload một hoặc nhiều ảnh lên Cloudinary
 * @param {File|File[]} files - File hoặc mảng file cần upload
 * @param {Function} onProgress - Callback khi có progress (optional)
 * @returns {Promise<string|string[]>} - URL hoặc mảng URLs của ảnh đã upload
 */
export const uploadImages = async (files, onProgress) => {
  const fileArray = Array.isArray(files) ? files : [files];
  const uploadedUrls = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);

        // Callback progress nếu có
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            percentage: Math.round(((i + 1) / fileArray.length) * 100),
          });
        }
      } else {
        throw new Error("No secure URL returned from Cloudinary");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  // Trả về string nếu upload 1 ảnh, array nếu nhiều ảnh
  return Array.isArray(files) ? uploadedUrls : uploadedUrls[0];
};

/**
 * Upload ảnh cho chat message
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} - URL của ảnh
 */
export const uploadChatImage = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Kiểm tra file có phải ảnh không
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Kiểm tra kích thước (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error("Image size must be less than 5MB");
  }

  return await uploadImages(file);
};

/**
 * Mở dialog chọn file và upload
 * IMPORTANT: Chỉ sử dụng trong Client Components với "use client" directive
 * @param {Object} options - Options cho upload
 * @param {boolean} options.multiple - Cho phép chọn nhiều file
 * @param {string} options.accept - MIME types cho phép (default: "image/*")
 * @param {number} options.maxSize - Kích thước tối đa (bytes, default: 5MB)
 * @param {Function} options.onStart - Callback khi bắt đầu
 * @param {Function} options.onProgress - Callback khi có progress
 * @param {Function} options.onSuccess - Callback khi thành công
 * @param {Function} options.onError - Callback khi có lỗi
 */
export const selectAndUploadImages = (options = {}) => {
  // Check if running in browser
  if (typeof window === "undefined") {
    console.error("selectAndUploadImages can only be called in the browser");
    return;
  }

  const {
    multiple = false,
    accept = "image/*",
    maxSize = 5 * 1024 * 1024, // 5MB default
    onStart,
    onProgress,
    onSuccess,
    onError,
  } = options;

  // Tạo input element
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  input.style.display = "none";

  input.onchange = async (e) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    // Validate file sizes
    const files = Array.from(selectedFiles);
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const error = new Error(
        `Some files exceed the maximum size of ${Math.round(
          maxSize / 1024 / 1024
        )}MB`
      );
      if (onError) onError(error);
      document.body.removeChild(input);
      return;
    }

    // Validate file types for images
    if (accept.includes("image/")) {
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        const error = new Error("Some files are not valid images");
        if (onError) onError(error);
        document.body.removeChild(input);
        return;
      }
    }

    const filesToUpload = multiple ? files : files[0];

    try {
      if (onStart) onStart();

      const urls = await uploadImages(filesToUpload, onProgress);

      if (onSuccess) onSuccess(urls);
    } catch (error) {
      console.error("Upload error:", error);
      if (onError) onError(error);
    } finally {
      // Cleanup
      document.body.removeChild(input);
    }
  };

  // Handle cancel
  input.oncancel = () => {
    document.body.removeChild(input);
  };

  // Thêm vào DOM và trigger click
  document.body.appendChild(input);
  input.click();
};

/**
 * Validate image file trước khi upload
 * @param {File} file - File cần validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Kích thước tối đa (bytes)
 * @param {string[]} options.allowedTypes - Các MIME types cho phép
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  } = options;

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${
        file.type
      } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Get image dimensions từ File object
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("This function can only run in the browser"));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
};

/**
 * Compress image trước khi upload (client-side)
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width
 * @param {number} options.maxHeight - Max height
 * @param {number} options.quality - Quality (0-1)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, options = {}) => {
  if (typeof window === "undefined") {
    throw new Error("Image compression can only run in the browser");
  }

  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
