const generateEmptyLine = (nbChar) => "<".repeat(nbChar);

const _checkReplaceSubStringInput = (str, subStr, position) => {
	if (position + subStr.length > str.length) {
		throw new Error("replaceSubStringAtPosition : invalid input");
	}
};

const replaceSubStringAtPositionToUpCase = (str, subStr, position) => {
	_checkReplaceSubStringInput(str, subStr, position);
	return (
		str.substring(0, position) +
		subStr.toUpperCase() +
		str.substring(position + subStr.length, str.length)
	);
};

const replaceSpecialCharsBySpaces = (str) => str.replace(/[ |-|-|']/g, "<");

const truncateString = (str, maxLength) => (str || "").substring(0, maxLength);

const stringDateToYYMMDD = (strDate) =>
	new Date(strDate).toISOString().slice(2, 10).replace(/-/g, "");

const lineLength = 44;

const generateMrzTd3 = (data) =>
	`${_generateLine1(data)}\n${_generateLine2(data)}`;

const _generateLine1 = ({ passport, user }) => {
	let line = generateEmptyLine(lineLength);
	line = generatePassportType(line, passport);
	line = generateCountryCode(line, passport.issuingCountry, 2);
	line = generateSurnameAndGivenNames(line, user, 5, lineLength);
	return line;
};

const _generateLine2 = ({ passport, user }) => {
	let line = generateEmptyLine(lineLength);
	line = generatePassportNumber(line, passport, 0);
	line = _generateUserNationality(line, user);
	line = _generateDateOfBirth(line, user);
	line = generateSex(line, user, 20);
	line = _generateExpirationDate(line, passport);
	line = _generateOptionalField(line, passport);
	return _generateGlobalDigitCheck(line);
};

const _generateUserNationality = (line, user) =>
	replaceSubStringAtPositionToUpCase(line, user.nationality, 10);

const _generateDateOfBirth = (line, user) =>
	generateDateWithCheckDigit(line, user.dateOfBirth, 13);

const _generateExpirationDate = (line, passport) =>
	generateDateWithCheckDigit(line, passport.expirationDate, 21);

const _generateOptionalField = (line, passport) => {
	let field = truncateString(passport.optionalField1?.toUpperCase(), 14);
	field = replaceSpecialCharsBySpaces(field);
	line = replaceSubStringAtPositionToUpCase(line, field, 28);
	const digitCheck = checkDigitCalculation(field);
	return replaceSubStringAtPositionToUpCase(line, digitCheck, 42);
};

const _generateGlobalDigitCheck = (line) => {
	let stringToBeChecked =
		line.slice(0, 10) + line.slice(13, 20) + line.slice(21, 43);
	const digitCheck = checkDigitCalculation(stringToBeChecked);
	return replaceSubStringAtPositionToUpCase(line, digitCheck, 43);
};

const checkDigitCalculation = (inputString) => {
	if (!_doesStringFitToFormat(inputString))
		throw new Error(
			"Check Digit : Input string does not match required format"
		);
	const arrayOfChars = _stringIntoArrayOfChars(inputString);
	const arrayOfNumbers = _arrayOfCharIntoArrayOfNumber(arrayOfChars);
	const weightedSum = _computeWeightedSum(arrayOfNumbers);
	return String(weightedSum % 10);
};

// Formatting / mapping --
// Example of mathing string: 'EREFGRE45<<<<ER'
const _doesStringFitToFormat = (inputString) =>
	new RegExp(/^([A-Z]|[0-9]|<)*$/g).test(inputString);

const _stringIntoArrayOfChars = (str) => str.split("");

const _arrayOfCharIntoArrayOfNumber = (arr) =>
	arr.map((chr) =>
		_isCharANumber(chr) ? Number(chr) : _convertCharIntoNumber(chr)
	);

const _convertCharIntoNumber = (chr) =>
	chr === "<" ? 0 : chr.charCodeAt(0) - 55;

const _isCharANumber = (chr) => Number(chr).toString() === chr;

// Calculation --
const _computeWeightedSum = (arrayOfNumbers) => {
	let result = 0;
	const weights = [7, 3, 1];
	arrayOfNumbers.forEach((value, i) => {
		result += weights[i % 3] * value;
	});
	return result;
};
const generateDateWithCheckDigit = (line, stringDate, position) => {
	const formatYYMMDD = stringDateToYYMMDD(stringDate);
	line = replaceSubStringAtPositionToUpCase(line, formatYYMMDD, position);
	const digitCheck = checkDigitCalculation(formatYYMMDD);
	return replaceSubStringAtPositionToUpCase(line, digitCheck, position + 6);
};

const generatePassportNumber = (line, passport, position) => {
	line = replaceSubStringAtPositionToUpCase(line, passport.number, position);
	const digitCheck = checkDigitCalculation(passport.number.toUpperCase());
	return replaceSubStringAtPositionToUpCase(line, digitCheck, position + 9);
};

const generatePassportType = (line, passport) => {
	line = replaceSubStringAtPositionToUpCase(line, passport.type, 0);
	if (passport.precisionType) {
		line = replaceSubStringAtPositionToUpCase(line, passport.precisionType, 1);
	}
	return line;
};

const generateCountryCode = (line, code, position) =>
	replaceSubStringAtPositionToUpCase(line, code, position);

// "F" = female, "M" = male, "<" = unspecified
const generateSex = (line, user, position) =>
	replaceSubStringAtPositionToUpCase(line, user.sex[0].toUpperCase(), position);

const generateSurnameAndGivenNames = (line, user, position, lineLength) => {
	const surname = replaceSpecialCharsBySpaces(
		user.surname.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
	);
	line = replaceSubStringAtPositionToUpCase(line, surname, position);

	const givenNamesPosition =
		position +
		user.surname.normalize("NFD").replace(/[\u0300-\u036f]/g, "").length +
		2;
	const givenNamesMaxLength = lineLength - givenNamesPosition;
	const givenNames = truncateString(
		replaceSpecialCharsBySpaces(
			user.givenNames.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		),
		givenNamesMaxLength
	);
	return replaceSubStringAtPositionToUpCase(
		line,
		givenNames,
		givenNamesPosition
	);
};
