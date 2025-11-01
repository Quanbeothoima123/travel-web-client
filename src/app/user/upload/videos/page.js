"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  FileVideo,
  CheckCircle,
  CloudUpload,
  Database,
  Heading,
  AlignLeft,
  MapPin,
  Map,
  Tags,
  Plus,
  X,
} from "lucide-react";
import ProvinceSelect from "@/components/common/ProvinceSelect";
import WardSelect from "@/components/common/WardSelect";
import LoadingModal from "@/components/common/LoadingModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function UploadShortVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
    province: null,
    ward: null,
    placeName: "",
    googleMap: "",
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Toast notification function (replace with your toast context)
  const showToast = (message, type) => {
    console.log(`[${type}] ${message}`);
    alert(message); // Replace with your toast implementation
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (province) => {
    setFormData((prev) => ({
      ...prev,
      province,
      ward: null,
    }));
  };

  const handleWardChange = (ward) => {
    setFormData((prev) => ({ ...prev, ward }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("Vui lòng chọn file video!", "error");
      e.target.value = null;
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("File video quá lớn! Vui lòng chọn file nhỏ hơn 20MB", "error");
      e.target.value = null;
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = function () {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;

      if (duration > 120) {
        showToast(
          "Video quá dài! Vui lòng chọn video ngắn hơn 2 phút",
          "error"
        );
        e.target.value = null;
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFormData((prev) => ({ ...prev, videoFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    };

    videoElement.onerror = function () {
      showToast(
        "Không thể đọc thông tin video. Vui lòng chọn file khác",
        "error"
      );
      e.target.value = null;
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      showToast("Vui lòng nhập tag!", "error");
      return;
    }

    if (tags.includes(trimmedTag)) {
      showToast("Tag đã tồn tại!", "error");
      return;
    }

    setTags((prev) => [...prev, trimmedTag]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề!", "error");
      return;
    }

    if (!formData.videoFile) {
      showToast("Vui lòng chọn video!", "error");
      return;
    }

    setLoading(true);
    setLoadingMessage("Đang tải video lên...");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("video", formData.videoFile);
    submitData.append("province", formData.province?._id || "");
    submitData.append("ward", formData.ward?._id || "");
    submitData.append("placeName", formData.placeName);
    submitData.append("googleMap", formData.googleMap);
    submitData.append("tags", JSON.stringify(tags));

    try {
      const response = await fetch(`${API_BASE}/api/v1/shorts/upload`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setLoadingMessage("Đang xử lý video...");
        await pollProcessingStatus(data.shortId);
        showToast("Tải video lên thành công!", "success");

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFormData({
          title: "",
          description: "",
          videoFile: null,
          province: null,
          ward: null,
          placeName: "",
          googleMap: "",
        });
        setTags([]);
        setPreviewUrl(null);
      } else {
        let errorMessage = data.message || "Upload failed";
        if (data.error === "FILE_TOO_LARGE") {
          errorMessage = `File quá lớn! Kích thước tối đa là ${data.maxSize}`;
        } else if (data.error === "INVALID_FILE_TYPE") {
          errorMessage = `Định dạng file không hợp lệ! Chỉ chấp nhận: ${data.allowedTypes.join(
            ", "
          )}`;
        } else if (data.duration && data.maxDuration) {
          errorMessage = `Video quá dài (${data.duration}s)! Thời lượng tối đa là ${data.maxDuration}s`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      showToast("Có lỗi xảy ra khi tải video lên: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const pollProcessingStatus = async (shortId) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/shorts/status/${shortId}`,
            {
              credentials: "include",
            }
          );
          const data = await response.json();

          if (data.status === "completed") {
            clearInterval(interval);
            resolve();
          } else if (data.status === "failed") {
            clearInterval(interval);
            reject(new Error("Video processing failed"));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 300000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto my-10 px-5">
      <LoadingModal
        open={loading}
        message={loadingMessage}
        icon="CloudUpload"
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-8 flex items-center gap-4">
          <Video className="w-8 h-8" />
          <h2 className="text-3xl font-semibold m-0">Tạo Video Short</h2>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <FileVideo className="w-5 h-5" />
              Video *
            </label>

            <div className="flex flex-col gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-purple-600 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <span>
                  Kích thước tối đa:{" "}
                  <strong className="text-purple-600 dark:text-purple-400 font-semibold">
                    20MB
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <span>
                  Thời lượng tối đa:{" "}
                  <strong className="text-purple-600 dark:text-purple-400 font-semibold">
                    2 phút
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <span>
                  Định dạng:{" "}
                  <strong className="text-purple-600 dark:text-purple-400 font-semibold">
                    MP4, MOV, AVI
                  </strong>
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-input"
              />
              <label htmlFor="video-input" className="block cursor-pointer">
                {previewUrl ? (
                  <div className="text-center">
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-full max-h-[300px] rounded-lg mb-4 mx-auto shadow-lg"
                    />
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 m-0 break-all">
                        <FileVideo className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        {formData.videoFile?.name}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 m-0">
                        <Database className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        {(formData.videoFile?.size / (1024 * 1024)).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-16 text-center transition-all hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800">
                    <CloudUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="my-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                      Nhấn để chọn video
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      MP4, MOV, AVI (Max 20MB, 2 phút)
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <Heading className="w-5 h-5" />
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
              placeholder="Nhập tiêu đề video..."
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <AlignLeft className="w-5 h-5" />
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y min-h-[100px] focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
              placeholder="Mô tả về video của bạn..."
              maxLength={500}
              rows={4}
            />
            <span className="block text-right text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formData.description.length}/500
            </span>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <MapPin className="w-5 h-5" />
              Tỉnh/Thành phố
            </label>
            <ProvinceSelect
              value={formData.province}
              onChange={handleProvinceChange}
              placeholder="Chọn tỉnh/thành phố..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <MapPin className="w-5 h-5" />
              Quận/Huyện
            </label>
            <WardSelect
              provinceCode={formData.province?.code}
              value={formData.ward}
              onChange={handleWardChange}
              placeholder="Chọn quận/huyện..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <MapPin className="w-5 h-5" />
              Tên địa điểm
            </label>
            <input
              type="text"
              name="placeName"
              value={formData.placeName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
              placeholder="VD: Hồ Hoàn Kiếm, Phố cổ..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <Map className="w-5 h-5" />
              Link Google Maps
            </label>
            <input
              type="url"
              name="googleMap"
              value={formData.googleMap}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3 text-base">
              <Tags className="w-5 h-5" />
              Tags
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
                placeholder="Nhập tag và nhấn Enter hoặc nút Thêm..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-linear-to-r from-purple-600 to-purple-800 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <X
                      className="w-4 h-4 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-purple-600 to-purple-800 text-white border-none px-8 py-4 rounded-xl text-base font-semibold cursor-pointer transition-all mt-8 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            <CloudUpload className="w-5 h-5" />
            Tải lên
          </button>
        </div>
      </div>
    </div>
  );
}
