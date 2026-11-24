export function validateProfileName(value: string): string | null {
  const name = value.trim();

  if (name.length < 2) return "Имя должно содержать минимум 2 символа";
  if (name.length > 160) return "Имя не должно превышать 160 символов";

  return null;
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  repeatPassword: string,
): string | null {
  if (!currentPassword) return "Введите текущий пароль";
  if (newPassword.length < 8) return "Новый пароль должен содержать минимум 8 символов";
  if (newPassword.length > 128) return "Новый пароль не должен превышать 128 символов";
  if (currentPassword === newPassword) return "Новый пароль должен отличаться от текущего";
  if (newPassword !== repeatPassword) return "Новые пароли не совпадают";

  return null;
}
