// Reusable password strength indicator component

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", met: /[a-z]/.test(password) },
    { label: "Number (0–9)", met: /[0-9]/.test(password) },
    { label: "Special character (!@#$…)", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter((r) => r.met).length;
  const allMet = metCount === requirements.length;

  const strengthLabel =
    metCount <= 1
      ? "Weak"
      : metCount <= 3
        ? "Fair"
        : metCount === 4
          ? "Good"
          : "Strong";

  const strengthColor =
    metCount <= 1
      ? "danger"
      : metCount <= 3
        ? "warning"
        : metCount === 4
          ? "info"
          : "success";

  return (
    <div className="mt-2">
      <div className="d-flex align-items-center gap-2 mb-1">
        <div className="progress flex-grow-1" style={{ height: "6px" }}>
          <div
            className={`progress-bar bg-${strengthColor}`}
            style={{
              width: `${(metCount / requirements.length) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <small
          className={`text-${strengthColor} fw-semibold`}
          style={{ minWidth: "48px" }}
        >
          {allMet ? "Strong" : strengthLabel}
        </small>
      </div>
      <ul className="list-unstyled mb-0" style={{ fontSize: "0.8rem" }}>
        {requirements.map((req) => (
          <li
            key={req.label}
            className={`d-flex align-items-center gap-1 ${req.met ? "text-success" : "text-danger"}`}
          >
            <i
              className={`bi ${req.met ? "bi-check-circle-fill" : "bi-x-circle"}`}
            />
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
