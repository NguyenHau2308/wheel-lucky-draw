let counter = 5;
export let codes = Array.from({ length: counter }, (_, i) =>
  "A" + String(i + 1).padStart(4, "0")
);

// // mỗi 20s thêm 1 khách hàng mới
// setInterval(() => {
//   counter++;
//   codes.push("A" + String(counter).padStart(4, "0"));
//   console.log("Added new code:", codes[codes.length - 1]);
// }, 5000);
