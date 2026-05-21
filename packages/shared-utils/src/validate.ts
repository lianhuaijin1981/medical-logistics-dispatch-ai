const PHONE_REGEX = /^1[3-9]\d{9}$/;
const LICENSE_PLATE_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/;

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function validateLicensePlate(plate: string): boolean {
  return LICENSE_PLATE_REGEX.test(plate);
}
