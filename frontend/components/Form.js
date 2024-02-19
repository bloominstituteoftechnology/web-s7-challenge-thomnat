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
    .required(validationErrors.sizeIncorrect)
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

  useEffect(() => {
    formSchema.isValid(values)
    .then(valid => setErrors(prevErrors => ({ ...prevErrors, submit: valid })))
    .catch(() => setErrors(prevErrors => ({ ...prevErrors, submit: true })));
  }, [values, formSchema]);

  const onChange = evt => {
    const { id, checked } = evt.target;

    if (id === 'fullName') {
      setValues({ ...values, fullName: evt.target.value });

      yup.reach(formSchema, 'fullName')
        .validate(evt.target.value)
        .then(() => setErrors({ ...errors, fullName: '' }))
        .catch( err => setErrors({ ...errors, fullName: err.errors[0] }));
    } else if (id === 'size') {
      setValues({ ...values, size: evt.target.value });

      yup.reach(formSchema, 'size') 
        .validate(evt.target.value)
        .then(() => setErrors({ ...errors, size: ''}))
        .catch( err => setErrors({ ...values, size: err.errors[0] }));
     } else if (id.startsWith('topping_')) {
        const toppingId = id.replace('topping_', '');
        const updatedToppings = values.toppings.map(topping => {
          if (topping.topping_id === toppingId) {
            return { ...topping, selected: checked };
        }
        return topping;
      });

        setValues({ ...values, toppings: updatedToppings });

    
      yup.reach(formSchema, `toppings.${toppingId}`)
        .validate(checked)
        .then(() => setErrors({ ...errors, [id]: ''}))
        .catch(err => setErrors({ ...errors, [id]: err.errors[0] }));
    } else if (id === 'submit') {
        if (errors.submit) {
        evt.preventDefault();
    

    axios.post('http://localhost:9009/api/order', values)
      .then(res => {
        setValues(getInitialValues());
        setServerSuccess(res.data.message);
        setServerFailure(null);
      })
      .catch(err => {
        setServerFailure(err.response.data.message);
        setServerSuccess(null);
      });
    }
  }
};

  return (
    <form>
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
      type="submit" 
      id="submit"
      disabled={errors.submit} 
      />
    </form>
  );

  
}