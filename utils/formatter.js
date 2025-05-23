/**
 * Định dạng số thông minh: không có dấu phẩy phần nghìn, dấu chấm phần thập phân
 * @param {Number} num - Số cần định dạng
 * @returns {String} - Chuỗi đã định dạng
 */
const formatSmart = (num) => {
  const floorVal = Math.floor(Math.abs(num));
  const fraction = Math.abs(num) - floorVal;
  
  if (fraction < 1e-9) {
    // Số nguyên: chỉ hiển thị số không có định dạng
    return Math.round(num).toString();
  } else {
    // Số thập phân: hiển thị với 2 chữ số sau dấu chấm
    return num.toFixed(2);
  }
};

/**
 * Định dạng giá trị tỷ lệ (rate)
 * @param {Number} num - Số cần định dạng
 * @returns {String} - Chuỗi đã định dạng
 */
const formatRateValue = (num) => {
  // Đảm bảo num là số
  num = parseFloat(num);
  if (isNaN(num)) {
    return "0";
  }
  
  // Nếu là số nguyên, trả về không có số thập phân
  if (Number.isInteger(num)) {
    return num.toString();
  }
  
  // Nếu là số thập phân, loại bỏ các số 0 ở cuối
  return num.toString().replace(/\.?0+$/, '');
};

/**
 * Kiểm tra xem chuỗi có phải biểu thức toán học hợp lệ không
 * @param {String} msg - Chuỗi cần kiểm tra
 * @returns {Boolean} - true nếu là biểu thức toán học
 */
const isMathExpression = (msg) => {
  const mathRegex = /^[0-9+\-*/().\s]+$/;
  return mathRegex.test(msg);
};

/**
 * Kiểm tra xem chuỗi có phải là một số đơn giản không
 * @param {String} msg - Chuỗi cần kiểm tra
 * @returns {Boolean} - true nếu là số đơn giản
 */
const isSingleNumber = (msg) => {
  const numberRegex = /^-?\d+(\.\d+)?$/;
  return numberRegex.test(msg.trim());
};

/**
 * Kiểm tra xem chuỗi có phải là địa chỉ TRC20 hợp lệ không
 * @param {String} str - Chuỗi cần kiểm tra
 * @returns {Boolean} - true nếu là địa chỉ TRC20 hợp lệ
 */
const isTrc20Address = (str) => {
  const re = /^T[1-9A-Za-z]{33}$/;
  return re.test(str);
};

/**
 * Format date in US style (MM/DD/YYYY)
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
const formatDateUS = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
};

/**
 * Định dạng thời gian theo định dạng 24h (HH:mm:ss) theo múi giờ Campuchia (Asia/Phnom_Penh)
 * @param {Date} date - Đối tượng ngày cần định dạng
 * @returns {String} - Chuỗi thời gian đã định dạng (ví dụ: 14:05:00)
 */
const formatTimeString = (date) => {
  return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false });
};

/**
 * Tạo tin nhắn telegram không sử dụng markdown
 * @param {Object} jsonData - Dữ liệu cần format
 * @returns {String} - Chuỗi đã định dạng
 */
const formatTelegramMessage = (jsonData) => {
  let output = '';
  
  // Date header - using US format (MM/DD/YYYY)
  const currentDate = new Date();
  const formattedDate = formatDateUS(currentDate);
  output += `*${formattedDate}:*\n`;
  
  // Deposits section
  if (jsonData.depositData && jsonData.depositData.entries && jsonData.depositData.entries.length > 0) {
    const depositCount = jsonData.depositData.totalCount || jsonData.depositData.entries.length;
    output += `*已入账* (${depositCount}笔):\n`;
    
    // Format giao dịch với ID và link
    jsonData.depositData.entries.forEach((entry) => {
      // Sử dụng ID từ entry thay vì tạo ID mới
      const id = entry.id || (entry.index + 1);
      if (entry.messageId && entry.chatLink) {
        // Tạo link đến tin nhắn gốc với ID là phần clickable
        output += `${entry.details} (id[${id}](${entry.chatLink}))\n`;
      }
    });
    output += '\n';
  } else {
    output += "*已入账*(0笔):\n\n";
  }
  
  // Payments section
  if (jsonData.paymentData && jsonData.paymentData.entries && jsonData.paymentData.entries.length > 0) {
    const paymentCount = jsonData.paymentData.totalCount || jsonData.paymentData.entries.length;
    output += `*已下发* (${paymentCount}笔):\n`;
    
    // Format giao dịch với ID và link
    jsonData.paymentData.entries.forEach((entry) => {
      // Dùng ký hiệu ! trước ID của payment
      // Sử dụng ID từ entry thay vì tạo ID mới
      const id = `!${entry.id || (entry.index + 1)}`;
      if (entry.messageId && entry.chatLink) {
        // Tạo link đến tin nhắn gốc với ID là phần clickable
        output += `${entry.details} ([${id}](${entry.chatLink}))\n`;
      }
    });
    output += '\n';
  } else {
    output += "*已下发*(0笔):\n\n";
  }
  output += `总入款💰: ${jsonData.totalAmount}\n`;
  // Rate information
  const rateInfo = `费率： ${jsonData.rate}\n汇率： ${jsonData.exchangeRate}\n`;
 
  // Thêm ví dụ nếu có
  let rateInfoWithExample = rateInfo;
  if (jsonData.example) {
    rateInfoWithExample += `\n例如: 100000 = ${jsonData.example} ${jsonData.currencyUnit || 'USDT'}`;
  }
  
  output += `${rateInfoWithExample}\n`;
  
  // Summary section
  output += `应下发 : ${jsonData.totalUSDT}  ${jsonData.currencyUnit || 'USDT'}\n`;
  output += `已下发 : ${jsonData.paidUSDT}  ${jsonData.currencyUnit || 'USDT'}\n`;
  output += `未下发 : ${jsonData.remainingUSDT}  ${jsonData.currencyUnit || 'USDT'}`;
  
  // Cards section (if present)
  if (jsonData.cards && jsonData.cards.length > 0) {
    output += `\n卡额度 💳:\n${jsonData.cards.join("\n")}`;
  }
  
  return output;
};

module.exports = {
  formatSmart,
  formatRateValue,
  isMathExpression,
  isSingleNumber,
  isTrc20Address,
  formatTelegramMessage,
  formatDateUS,
  formatTimeString
}; 