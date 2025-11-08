export const Total = (props) => {
    const total = props.parts.map(part => part.exercises).reduce((sum, exercise) => sum + exercise, 0);
    return <p>Number of exercises {total}</p>
}