import { pb } from '../../services/pocketbase';

export interface CustomerRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  taxCode: string;
  companyAddress?: string;
  notificationEmail?: string;
  companyPhone?: string;
}

export interface RegistrationRequestRecord {
  id: string;
  user?: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  taxCode: string;
  companyAddress?: string;
  notificationEmail?: string;
  companyPhone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  created: string;
  updated: string;
  expand?: {
    user?: any;
    reviewedBy?: any;
  };
}

/**
 * Validate customer registration input data
 */
export const validateRegistrationInput = (data: CustomerRegistrationData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Vui lòng nhập họ và tên';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !data.email.trim()) {
    errors.email = 'Vui lòng nhập email đăng nhập';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Định dạng email không hợp lệ';
  }

  const phoneClean = (data.phone || '').trim().replace(/[\s.-]/g, '');
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (phoneClean.length < 9 || phoneClean.length > 15 || !/^[0-9+]+$/.test(phoneClean)) {
    errors.phone = 'Vui lòng nhập số điện thoại hợp lệ (9 - 15 chữ số)';
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  }

  if (data.password !== data.passwordConfirm) {
    errors.passwordConfirm = 'Mật khẩu xác nhận không khớp';
  }

  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.companyName = 'Vui lòng nhập tên công ty';
  }

  const taxClean = (data.taxCode || '').trim();
  if (!data.taxCode || !taxClean) {
    errors.taxCode = 'Vui lòng nhập mã số thuế';
  } else if (taxClean.length < 8 || taxClean.length > 16 || !/^[0-9A-Za-z-]+$/.test(taxClean)) {
    errors.taxCode = 'Mã số thuế không hợp lệ (thường gồm 10 - 13 chữ số)';
  }

  if (data.notificationEmail && !emailRegex.test(data.notificationEmail.trim())) {
    errors.notificationEmail = 'Email nhận thông báo không đúng định dạng';
  }

  return errors;
};

/**
 * Submit Customer Registration request
 */
export const submitCustomerRegistration = async (
  data: CustomerRegistrationData
): Promise<{ success: boolean; id?: string; error?: string }> => {
  // 1. Client-side validation check
  const valErrors = validateRegistrationInput(data);
  if (Object.keys(valErrors).length > 0) {
    const firstError = Object.values(valErrors)[0];
    return { success: false, error: firstError };
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanTax = data.taxCode.trim().toUpperCase();

  try {
    // 2. Kiểm tra xem email đã tồn tại trong hệ thống chưa
    try {
      const existingUser = await pb.collection('users').getFirstListItem(`email = "${cleanEmail}"`);
      if (existingUser) {
        return {
          success: false,
          error: 'Email này đã tồn tại trên hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.',
        };
      }
    } catch (_err) {
      // Record not found -> email is available
    }

    // 3. Khởi tạo tài khoản xác thực users với role=customer và status=pending
    // PocketBase tự động mã hóa mật khẩu an toàn bằng bcrypt
    const userRecord = await pb.collection('users').create({
      email: cleanEmail,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      name: data.fullName.trim(),
      phone: data.phone.trim(),
      role: 'customer',
      status: 'pending',
    });

    // 4. Lưu hồ sơ đăng ký vào registration_requests (KHÔNG lưu mật khẩu)
    const requestRecord = await pb.collection('registration_requests').create({
      user: userRecord.id,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      companyName: data.companyName.trim(),
      taxCode: cleanTax,
      companyAddress: data.companyAddress?.trim() || '',
      notificationEmail: data.notificationEmail?.trim().toLowerCase() || cleanEmail,
      companyPhone: data.companyPhone?.trim() || data.phone.trim(),
      status: 'PENDING',
    });

    return {
      success: true,
      id: requestRecord.id,
    };
  } catch (err: any) {
    console.error('Registration submission failed:', err);
    // Parse PocketBase validation messages
    const message =
      err?.data?.data?.email?.message ||
      err?.data?.data?.password?.message ||
      err?.message ||
      'Không thể gửi yêu cầu đăng ký. Vui lòng thử lại sau.';
    return {
      success: false,
      error: message.includes('already exists')
        ? 'Email này đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.'
        : message,
    };
  }
};
