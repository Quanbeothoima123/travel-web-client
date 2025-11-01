"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Gauge,
  X,
  Search,
  Loader,
  Sun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Calendar,
  ChevronRight,
} from "lucide-react";

const WeatherWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const locationUpdateTimerRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || "YOUR_API_KEY";
  const DEFAULT_CITY = "Hanoi";
  const LOCATION_UPDATE_INTERVAL = 15 * 60 * 1000;

  const setCookie = (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const saveLocationToCookie = (lat, lon) => {
    const locationData = JSON.stringify({
      lat,
      lon,
      timestamp: Date.now(),
    });
    setCookie("userLocation", locationData);
  };

  const getLocationFromCookie = () => {
    const locationData = getCookie("userLocation");
    if (locationData) {
      try {
        return JSON.parse(locationData);
      } catch (e) {
        console.error("Error parsing location cookie:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (isOpen && !weather && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const savedLocation = getLocationFromCookie();
      if (savedLocation?.lat && savedLocation?.lon) {
        fetchWeatherByCoords(savedLocation.lat, savedLocation.lon);
      } else {
        fetchWeatherByCity(DEFAULT_CITY);
      }
    }

    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const savedLocation = getLocationFromCookie();
      if (savedLocation?.lat && savedLocation?.lon) {
        const timeSinceLastUpdate = Date.now() - savedLocation.timestamp;
        if (timeSinceLastUpdate >= LOCATION_UPDATE_INTERVAL) {
          updateCurrentLocation(true);
        }

        locationUpdateTimerRef.current = setInterval(() => {
          updateCurrentLocation(true);
        }, LOCATION_UPDATE_INTERVAL);
      }
    }

    return () => {
      if (locationUpdateTimerRef.current) {
        clearInterval(locationUpdateTimerRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cityInput.trim().length >= 2) {
        fetchCitySuggestionsFromOSM(cityInput.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cityInput]);

  // Sử dụng Nominatim (OpenStreetMap) để tìm kiếm địa điểm
  const fetchCitySuggestionsFromOSM = async (query) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&accept-language=vi&addressdetails=1`,
        {
          headers: {
            "User-Agent": "WeatherWidget/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải gợi ý địa điểm");
      }

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("Error fetching OSM suggestions:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`,
        {
          headers: {
            "User-Agent": "WeatherWidget/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy tên địa điểm");
      }

      const data = await response.json();
      const address = data.address;
      let locationName = "";

      if (address.suburb || address.quarter || address.neighbourhood) {
        locationName =
          address.suburb || address.quarter || address.neighbourhood;
      } else if (address.village || address.hamlet) {
        locationName = address.village || address.hamlet;
      } else if (address.city_district || address.county) {
        locationName = address.city_district || address.county;
      } else if (address.city || address.town) {
        locationName = address.city || address.town;
      } else if (address.state) {
        locationName = address.state;
      } else {
        locationName = data.display_name.split(",")[0];
      }

      const district = address.city_district || address.county;
      if (district && !locationName.includes(district)) {
        locationName += `, ${district}`;
      }

      const city = address.city || address.town || address.state;
      if (city && !locationName.includes(city)) {
        locationName += `, ${city}`;
      }

      return locationName;
    } catch (err) {
      console.error("Error in reverse geocoding:", err);
      return null;
    }
  };

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("API key không hợp lệ. Vui lòng kiểm tra lại.");
        }
        throw new Error("Không tìm thấy thành phố");
      }

      const data = await response.json();
      setWeather(data);

      // Fetch forecast
      await fetchForecast(data.coord.lat, data.coord.lon);

      setShowSuggestions(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon, saveLocation = false) => {
    setLoading(true);
    setError(null);

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error("API key không hợp lệ. Vui lòng kiểm tra lại.");
        }
        throw new Error("Không thể lấy dữ liệu thời tiết");
      }

      const weatherData = await weatherResponse.json();
      const locationName = await getLocationName(lat, lon);

      if (locationName) {
        weatherData.name = locationName;
        weatherData.displayName = locationName;
      }

      setWeather(weatherData);

      // Fetch forecast
      await fetchForecast(lat, lon);

      if (saveLocation) {
        saveLocationToCookie(lat, lon);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dự báo 3 ngày
  const fetchForecast = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu dự báo");
      }

      const data = await response.json();

      // Lọc dữ liệu để lấy 1 dự báo mỗi ngày (lúc 12:00)
      const dailyForecasts = [];
      const processedDates = new Set();

      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString("vi-VN");
        const hour = new Date(item.dt * 1000).getHours();

        // Lấy dự báo lúc 12h hoặc gần 12h nhất
        if (!processedDates.has(date) && hour >= 11 && hour <= 13) {
          processedDates.add(date);
          dailyForecasts.push(item);
        }
      });

      setForecast(dailyForecasts.slice(0, 3));
    } catch (err) {
      console.error("Error fetching forecast:", err);
    }
  };

  const updateCurrentLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    if (!silent) setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude, true);
      },
      (err) => {
        if (!silent) {
          setError(
            "Không thể truy cập vị trí. Vui lòng cho phép truy cập vị trí."
          );
          setLoading(false);
        }
      }
    );
  };

  const handleGetLocation = () => {
    updateCurrentLocation(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeatherByCity(cityInput.trim());
      setCityInput("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    fetchWeatherByCoords(
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
      false
    );
    setCityInput("");
    setShowSuggestions(false);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getCustomWeatherIcon = (weatherMain, size = 60) => {
    const iconProps = { size, strokeWidth: 1.5 };

    switch (weatherMain?.toLowerCase()) {
      case "clear":
        return <Sun {...iconProps} className="text-yellow-400" />;
      case "clouds":
        return <Cloud {...iconProps} className="text-gray-400" />;
      case "rain":
        return <CloudRain {...iconProps} className="text-blue-500" />;
      case "drizzle":
        return <CloudDrizzle {...iconProps} className="text-blue-400" />;
      case "snow":
        return <CloudSnow {...iconProps} className="text-blue-200" />;
      default:
        return <Cloud {...iconProps} className="text-gray-400" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      dayName: days[date.getDay()],
      date: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  };

  return (
    <>
      {/* Trigger button - Góc trái dưới */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 z-[998]"
        aria-label="Xem thời tiết"
      >
        <Cloud size={20} />
        <span>Thời tiết</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-weatherFadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-[90%] max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-weatherSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <Cloud size={24} />
                <h3 className="text-xl font-semibold">Thời tiết</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="bg-gray-50 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-2 p-4">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                    placeholder="Nhập tên địa điểm..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                  />

                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 animate-weatherDropdownSlide"
                    >
                      {loadingSuggestions ? (
                        <div className="flex items-center justify-center gap-2 p-4 text-purple-600">
                          <Loader className="animate-spin" size={20} />
                          <span className="text-sm">Đang tìm kiếm...</span>
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <MapPin
                              size={16}
                              className="text-purple-600 mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate">
                                {suggestion.display_name.split(",")[0]}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.display_name}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Tìm kiếm"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Location button */}
            <button
              onClick={handleGetLocation}
              disabled={loading}
              className="flex items-center justify-center gap-2 mx-6 mt-4 px-4 py-2.5 bg-white text-purple-600 border-2 border-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin size={16} />
              <span>Sử dụng vị trí hiện tại</span>
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-purple-600">
                  <Loader className="animate-spin mb-4" size={32} />
                  <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-red-500 mb-4 text-sm">{error}</p>
                  <button
                    onClick={() => fetchWeatherByCity(DEFAULT_CITY)}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {weather && !loading && !error && (
                <div className="animate-weatherFadeIn">
                  {/* Current Weather */}
                  <div className="text-center py-6 border-b-2 border-gray-100">
                    <div className="flex items-center justify-center gap-2 mb-4 text-gray-700">
                      <MapPin size={18} />
                      <h2 className="text-2xl font-semibold">
                        {weather.displayName ||
                          `${weather.name}, ${weather.sys.country}`}
                      </h2>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-2">
                      <div className="flex flex-col items-center relative">
                        <div className="opacity-30">
                          {getCustomWeatherIcon(weather.weather[0].main)}
                        </div>
                        <img
                          src={getWeatherIcon(weather.weather[0].icon)}
                          alt={weather.weather[0].description}
                          className="w-24 h-24 -mt-5"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-5xl font-bold text-gray-900">
                          {Math.round(weather.main.temp)}°C
                        </div>
                        <div className="text-base text-gray-600 capitalize">
                          {weather.weather[0].description}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      Cảm giác như {Math.round(weather.main.feels_like)}°C
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        <Droplets size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Độ ẩm</div>
                        <div className="text-base font-semibold text-gray-900">
                          {weather.main.humidity}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        <Wind size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Tốc độ gió</div>
                        <div className="text-base font-semibold text-gray-900">
                          {weather.wind.speed} m/s
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        <Gauge size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Áp suất</div>
                        <div className="text-base font-semibold text-gray-900">
                          {weather.main.pressure} hPa
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        <Eye size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Tầm nhìn</div>
                        <div className="text-base font-semibold text-gray-900">
                          {weather.visibility
                            ? (weather.visibility / 1000).toFixed(1)
                            : "N/A"}{" "}
                          km
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="flex justify-between items-center py-2 text-sm text-gray-700 border-b border-gray-300">
                      <span>Nhiệt độ cao nhất:</span>
                      <strong className="text-gray-900">
                        {Math.round(weather.main.temp_max)}°C
                      </strong>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm text-gray-700">
                      <span>Nhiệt độ thấp nhất:</span>
                      <strong className="text-gray-900">
                        {Math.round(weather.main.temp_min)}°C
                      </strong>
                    </div>
                  </div>

                  {/* Forecast 3 days */}
                  {forecast && forecast.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4 text-gray-900">
                        <Calendar size={20} />
                        <h3 className="text-lg font-semibold">
                          Dự báo 3 ngày tới
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {forecast.map((day, index) => {
                          const dateInfo = formatDate(day.dt);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-center min-w-[50px]">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {dateInfo.dayName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {dateInfo.date}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={getWeatherIcon(day.weather[0].icon)}
                                    alt={day.weather[0].description}
                                    className="w-12 h-12"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                      {day.weather[0].description}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900">
                                  {Math.round(day.main.temp)}°C
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <Droplets size={12} />
                                  {day.main.humidity}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
              <small className="text-xs text-gray-600">
                Dữ liệu từ OpenWeatherMap & OpenStreetMap
              </small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherWidget;
