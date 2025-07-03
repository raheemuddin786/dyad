export const getButtonVariant = (theme: "light" | "dark") => {
  return theme === "light"
    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
    : "bg-gray-800 text-white hover:bg-gray-700";
};
