import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'

const App = () => {

  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterPerson, setFilterPerson] = useState('')

  const filterPersons = filterPerson ? persons.filter(({ name, number }) => name.toLowerCase().includes(filterPerson.toLowerCase()) || number.toLowerCase().includes(filterPerson.toLowerCase())) : persons

  const handleSave = (event) => {
    event.preventDefault();

    const exist = persons.some(person => person.name === newName);

    if (exist) {
      alert(`${newName} já está incluído no phonebook`);
      return;
    }

    const saveObject = {
      name: newName,
      number: newNumber
    }

    axios.post('http://localhost:3001/persons', saveObject)
      .then(response => {
        setPersons(persons.concat(response.data));
        console.log('response:', response);
        setNewName("");
      })

    
  }

  useEffect(() => {
    axios.get('http://localhost:3001/persons')
      .then(response => {
        const persons = response.data;
        setPersons(persons);
        console.log('persons:', persons);
      })

  }, [])

  return (
    <div>
      <div>debug: {newName}</div>
      <div>
        filter: <input value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} />
      </div>
      <h2>Phonebook</h2>
      <form onSubmit={handleSave}>
        <div>
          name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          number: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      {filterPersons.map(person => (
        <div key={person.name}>{person.name} {person.number}</div>
      ))}
    </div>
  )
}

export default App