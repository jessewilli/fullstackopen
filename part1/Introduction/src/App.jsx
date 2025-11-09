import { Header } from "./Header.jsx";
import { Content } from "./Content.jsx";
import { Total } from "./Total.jsx";
import { useState } from "react";

const App = () => {
  const [counter, setCounter] = useState(0);
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  const parts = course.parts;
  


  return (
    <>
      <div>{counter}</div>
      <div>
        <Header course={course.name} />
        <Content parts={parts} />
        <Total parts={parts} />
      </div>
    </>
  )
}

export default App