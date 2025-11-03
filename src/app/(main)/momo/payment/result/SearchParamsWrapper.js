"use client";

import { useSearchParams } from "next/navigation";

const SearchParamsWrapper = ({ onParamsReady }) => {
  const searchParams = useSearchParams();

  if (onParamsReady) {
    onParamsReady({
      orderId: searchParams.get("orderId"),
      resultCode: searchParams.get("resultCode"),
      transId: searchParams.get("transId"),
    });
  }

  return null;
};

export default SearchParamsWrapper;
