package domain

// Общие ошибки
const (
	SignInError          = "failed to sign in"
	SignUpError          = "failed to sign up"
	FieldValidationError = "invalid request body"
	UnAuthorizedError    = "not authorized"
	InvalidIdError       = "invalid user id"
)

// Ошибки в пользователе
const (
	NoUIDError                = "no user id"
	NoRoleError               = "no user role"
	InvalidRoleError          = "invalid user role"
	GetRoleByUIDError         = "failed get role by uid"
	ParseTokenError           = "failed to parse token"
	PasswordResetRequestError = "failed to reset password"
	PasswordResetError        = "failed to reset password"
	AntiFraudDeniedRegError   = "antifraud denied registration"
)

// Ошибки чата
const (
	GetChatError      = "failed to get or create chat"
	AddMessageError   = "failed to add message"
	ClearContextError = "failed to clear context"
	GetTheoryError    = "failed to get theory"
)

// Ошибки сочинений

const (
	GetEssayThemesFailed = "failed to get essay themes"
	EssayGraduateError   = "failed to graduate essay"
	FactsGetError        = "failed to get facts"
	EssayScanError       = "failed to scan essay"
)

const (
	CreatePaymentLinkError = "failed to create payment link"
)
