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
  size: yup.string(validationErrors.sizeIncorrect)
    .required()
    .oneOf(['S', 'M', 'L']),
  toppings: yup.object().shape({
    topping_1: yup.boolean(),
    topping_2: yup.boolean(),
    topping_3: yup.boolean(),
    topping_4: yup.boolean(),
    topping_5: yup.boolean(),
  })
});


const getInitialValues = () => ({
  fullName: '',
  size: '',
  toppings: toppings.map(topping => ({ ...topping, selected: false })),
})

const getInitialErrors = () => ({
  fullName: '',
  size: '',
  toppings: {},
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
    const isFullNameValid = values.fullName && values.fullName.trim() !== '';
    const isSizeValid = values.size && values.size.trim() !== '';

    setSubmitEnabled(isFullNameValid && isSizeValid);
  }, [values]);

  const onChange = evt => {
    const { id, checked, value } = evt.target;

    if (id === 'fullName') {
      setValues({ ...values, fullName: value });
    } else if (id === 'size') {
      setValues({ ...values, size: value });
    } else if (id.startsWith('topping_')) {
      const toppingId = id.replace('topping_', '');
        const updatedToppings = values.toppings.map(topping => 
          topping.topping_id === toppingId ? {...topping, selected: checked } : topping
      );
      setValues({ ...values, toppings: updatedToppings });
    }

    formSchema.validate(values)
      .then(() => setErrors({}))
      .catch(err => setErrors(err.errors));
  };


    const handleSubmit = evt => {
      evt.preventDefault()

      const selectedToppings = values.toppings
        .filter(topping => topping.selected)
        .reduce((acc, topping) => {
          acc[topping.topping_id] = {
            text: topping.text,
            selected: topping.selected
          };
          return acc;
        }, {});

      const formData = {
        fullName: values.fullName,
        size: values.size,
        toppings: selectedToppings
      };
      
      axios.post('http://localhost:9009/api/order', formData)
      .then(res => {
        setValues(getInitialValues())
        setServerSuccess(res.data.message)
        setServerFailure()
      })
      .catch(err => {
        setServerFailure(err.response.data.message)
        setServerSuccess()
      })
    }
  

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
        <label>
          {toppings.map((topping) => (
            <div key={topping.topping_id}>
            <input 
            type="checkbox" 
            id={`topping_${topping.topping_id}`}
            value={topping.topping_id}
            checked={topping.selected}
            onChange={onChange}
            />
            {topping.text}
            </div>
          ))}
        </label>
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