// https://github.com/ndelvalle/array-smooth
const smooth = (arr, windowSize, getter = (value) => value, setter) => {
	const get = getter
	const result = []

	for (let i = 0; i < arr.length; i += 1) {
		const leftOffset = i - windowSize
		const from = leftOffset >= 0 ? leftOffset : 0
		const to = i + windowSize + 1

		let count = 0
		let sum = 0
		for (let j = from; j < to && j < arr.length; j += 1) {
			sum += get(arr[j])
			count += 1
		}

		result[i] = setter ? setter(arr[i], sum / count) : sum / count
	}

	return result;
};

const average = (arr) => arr.reduce((memo, val) => memo + val, 0) / arr.length;

// Limit array size by cutting off from the start
const limit = (arr, maxLength = 10) => {
	const deleteCount = Math.max(0, arr.length - maxLength);

	return arr.slice(deleteCount);
};

export {
	smooth,
	average,
	limit,
};