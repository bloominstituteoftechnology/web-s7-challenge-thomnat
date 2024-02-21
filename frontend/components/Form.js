import React, { useEffect, useState } from 'react'
import * as yup from 'yup';
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup.string().trim().required()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: yup.string()
    .required()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect),
});


const getInitialValues = () => ({
  fullName: '',
  size: '',
  toppings: [],
})

const getInitialErrors = () => ({
  fullName: '',
  size: '',
  toppings: [],
})


// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {

  const [values, setValues] = useState(getInitialValues())
  const [errors, setErrors] = useState(getInitialErrors())
  const [serverSuccess, setServerSuccess] = useState()
  const [serverFailure, setServerFailure] = useState()
  const [submitEnabled, setSubmitEnabled] = useState(false)

  useEffect(() => {
   formSchema.isValid(values).then((isValid) => {
    setSubmitEnabled(isValid)
   })
  }, [values.fullName, values.size]);

  const validate = (key, value) => {
    yup
    .reach(formSchema, key)
    .validate(value)
    .then(() => {
      setErrors({ ...errors, [key]: ''})
    }).catch(errors => {
      setErrors({ ...errors, [key]: errors.errors[0] })
    })
  }

  const changeTopping = (evt) => {
    const { name, checked } = evt.target
    if (checked) setValues({ ...values, toppings: [ ...values.toppings, name ]})
  else setValues({ ...values, toppings: values.toppings.filter(t => t != name )})
  }

  const onChange = evt => {
    const { id, value } = evt.target;



    validate(id, value)
    setValues({ ...values, [id]: value })


    
  };


    const handleSubmit = evt => {
      evt.preventDefault()

      
      
      axios.post('http://localhost:9009/api/order', values)
      .then(res => {
        setServerSuccess(res.data.message);
        setServerFailure('');
        setValues(getInitialValues());
      })
      .catch(err => {
        // console.log(error.response.data);
        setServerFailure(err?.response?.data?.message)
        setServerSuccess('')
      });
    };
  

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className='success'>{serverSuccess}</div>}
      {serverFailure && <div className='failure'>{serverFailure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input 
          placeholder="Type full name" 
          id="fullName" 
          type="text" 
          value={values.fullName}
          onChange={onChange}
          />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select 
          id="size"
          value={values.size}
          onChange={onChange}
          >
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
          {toppings.map(({topping_id, text}) => (
            <label key={topping_id}>
            <input 
            type="checkbox" 
            checked={!!values.toppings.find(t => t == topping_id)}
            onChange={changeTopping}
            name={topping_id}
            />
            {text}
            </label>
          ))}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input 
      id="submit"
      disabled={!submitEnabled} 
      type="submit" 
      />
    </form>
  )
}