export function and(update, state, react, payload) {
	return (...actions) => {
		if (actions.length > 0) {
			const action = actions.shift()
			let result = {}

			if (typeof action !== "function") {
				throw new TypeError(action + " is not a function")
			}

			const apply = (...args) => {
				if (args.length + actions.length > 0) {
					and(update, state, react, payload)(...args, ...actions)
				}
			}

			result = action({
				state: state(),
				and: (...args) => () => apply(...args),
				error: payload.error
			})

			if (typeof result == "function") {
				result({apply})
				return
			}

			if (result instanceof Error === false) {
				update(result)
				react(state())
			}

			if (actions.length > 0) {
				const payload = {}

				if (result instanceof Error) {
					payload.error = result
				}

				return and(update, state, react, payload)(...actions)
			}
		}
	}
}

export function init(value) {
	let state = value
	const subscribers = []

	return {
		apply: and(newState => state = newState, () => state, state => subscribers.forEach(fn => fn(state)), {}),
		subscribe: f => subscribers.push(f),
		getState: () => state
	}
}

export default init;