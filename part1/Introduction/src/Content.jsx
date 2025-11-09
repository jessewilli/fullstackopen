export const Content = (props) => {
    return props.parts.map(part =>    
        <p key={part.name}>
            {part.name} {part.exercises}
        </p>
    );
}