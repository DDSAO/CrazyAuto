export const getClassname = (product_kind: string, product_type: string) => {
  let className = "unclassified";

  if (product_kind) {
    if (product_kind === "accessory") {
      className = "accessory";
    } else if (product_kind === "phone") {
      className = "phone";
    } else if (product_kind === "part") {
      className = "parts";
    } else if (product_kind === "Part") {
      className = "parts";
    } else {
      if (product_type === "Tools" || product_type === "Test Cables")
        className = "unclassified";
    }
  }

  return className;
};
