export const Total = (props) => {
    const total = props.parts.map(part => part.exercises).reduce((total, valor) => total + valor, -2 );
    return <p>Number of exercises {total}</p>
}