import React, { Component, HTMLAttributes, ReactNode } from "react"
import classNames from "classnames"

export interface PickerItem<T extends string> {
	value: T
	children?: ReactNode
	title: string
}
interface PickerProps<T extends string> extends HTMLAttributes<HTMLDivElement> {
	value: T
	onchange: (value: T) => void
	items: PickerItem<T>[]
	id: string
	title: string
}
export class Picker<T extends string> extends Component<PickerProps<T>> {
	constructor(props: PickerProps<T>) {
		super(props)
	}
	public render(): any {
		const { value, title, items, id, onchange, ...htmlAttributes } = this.props
		return (
			<div {...htmlAttributes} id={id}>
				<div className="title">{title}</div>
				{items.map(({ value: ovalue, title, children }) => (
					<label className={classNames("picker-option", ovalue === value && "selected")} key={ovalue}>
						<div className="title">
							{title}
							<input
								type="radio"
								value={ovalue}
								name={id}
								checked={ovalue == value}
								onChange={e => e.target.checked && onchange(e.target.value as any)}
							/>
						</div>
						{children}
					</label>
				))}
			</div>
		)
	}
}

// export function PickerOption({
// 	onClick,
// 	title,
// 	children,
// 	selected,
// 	name,
// 	value,
// }: {
// 	name: string
// 	value: string
// 	onClick: () => void
// 	title: string
// 	children?: ReactNode
// 	selected: boolean
// }) {
// 	return (
// 		<label className={classNames("picker-option", selected && "selected")} onClick={onClick} key={value}>
// 			<div className="title">{title}</div>
// 			{children}
// 			<input type="radio" value={value} name={name} id={name + value} />
// 		</label>
// 	)
// }
