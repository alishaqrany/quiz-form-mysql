import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm, formValueSelector } from 'redux-form';
import range from 'lodash/range';
import validate from '../Helpers/validate';

import {firestore} from '../Services/firebaseConfig'; // استيراد ملف التكوين الخاص بـ Firebase

// استيراد وظيفة حفظ الاختبار
// import Quiz, { saveQuiz } from '../Services/QuizModel';

class QuizForm extends Component {
  renderInputField = ({ input, label, type, meta: { touched, error } }) => (
    <div>
      <label>{label}</label>
      <div>
        <input {...input} type={type} placeholder={label} />
        {touched && error && <span>{error}</span>}
      </div>
    </div>
  );

  renderTextareaField = ({ input, label, type, meta: { touched, error } }) => (
    <div>
      <label>{label}</label>
      <div>
        <textarea {...input} type={type} placeholder={label} />
        {touched && error && <span>{error}</span>}
      </div>
    </div>
  );

  renderSelectField = ({ input, label, type, meta: { touched, error }, children }) => (
    <div>
      <label>{label}</label>
      <div>
        <select {...input}>
          {children}
        </select>
        {touched && error && <span>{error}</span>}
      </div>
    </div>
  );

  renderSelectQuestionTypeField = ({ input, label, type, meta: { touched, error }, children }) => (
    <div>
      <label>{label}</label>
      <div>
        <select {...input}>
          {children}
        </select>
        {touched && error && <span>{error}</span>}
      </div>
    </div>
  );

  renderTextAnswers = ({ fields, question, meta: { error } }) => (
    <ul>
      <li>
        <button type="button" onClick={() => fields.push()}>Add Answer</button>
      </li>
      {fields.map((answer, index) => (
        <li key={index}>
          <button
            type="button"
            title="Remove Answer"
            onClick={() => fields.remove(index)}
          />
          <Field
            name={answer}
            type="text"
            component={this.renderInputField}
            label={`Answer #${index + 1}`}
          />
        </li>
      ))}
      <li>
        <Field
          name={`${question}.correctAnswer`}
          component={this.renderSelectField}
          label="Correct Answer"
        >
          <option value="">Please select correct answer</option>
          {fields.map((answer, index) => (
            <option key={index + 1} value={index + 1}>{`Answer #${index + 1}`}</option>
          ))}
        </Field>
      </li>

      {error && <li className="error">{error}</li>}
    </ul>
  );

  renderQuestions = ({ fields, meta: { touched, error, submitFailed } }) => (
    <ul>
      <li>
        <button type="button" onClick={() => fields.push({})}>Add Question</button>
        {(touched || submitFailed) && error && <span>{error}</span>}
      </li>
      {fields.map((question, index) => (
        <li key={index}>
          <button
            type="button"
            title="Remove Question"
            onClick={() => fields.remove(index)}
          />
          <h4>Question #{index + 1}</h4>
          <Field
            name={`${question}.question`}
            type="text"
            component={this.renderInputField}
            label="Question Title"
          />
          <Field
            name={`${question}.questionType`}
            component={this.renderSelectQuestionTypeField}
            label="Question Type"
          >
            <option value="">Please select a question type</option>
            <option value="text">Text</option>
            <option value="photo">Photo</option>
          </Field>
          <FieldArray name={`${question}.answers`} component={this.renderTextAnswers} question={question} />
          <Field
            name={`${question}.messageForCorrectAnswer`}
            type="text"
            component={this.renderTextareaField}
            label="Message for Correct Answer"
          />
          <Field
            name={`${question}.messageForIncorrectAnswer`}
            type="text"
            component={this.renderTextareaField}
            label="Message for Incorrect Answer"
          />
          <Field
            name={`${question}.explanation`}
            type="text"
            component={this.renderTextareaField}
            label="Explanation"
          />
          <Field
            name={`${question}.point`}
            type="number"
            component={this.renderInputField}
            label="Point"
          />
        </li>
      ))}
    </ul>
  );




  onSubmit = (values) => {
    // حفظ الاختبار في قاعدة البيانات Firebase
    firestore.database().ref('quizzes').push(values)
      .then(() => {
        // تم حفظ الاختبار بنجاح
        console.log('Quiz saved successfully')
      })
      .catch((error) => {
        // حدث خطأ أثناء حفظ الاختبار
      });
  };


  
  // handleSubmit = (values) => {
  //   // قم بتشغيل وظيفة saveQuiz هنا واستخدامها لحفظ الاختبار
  //   const quiz = new Quiz();
  //   quiz.quizTitle = values.quizTitle;
  //   quiz.quizSynopsis = values.quizSynopsis;
  //   quiz.saveQuiz(); // استخدام وظيفة saveQuiz
  // }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <div className="QuizForm">
        <form name="quiz-form" onSubmit={handleSubmit(this.onSubmit)}>
          <Field
            name="quizTitle"
            type="text"
            component={this.renderInputField}
            label="Quiz Title"
          />
          <Field
            name="quizSynopsis"
            type="text"
            component={this.renderTextareaField}
            label="Quiz Synopsis"
          />
          <FieldArray name="questions" component={this.renderQuestions} />
          <div>
            <button type="submit" disabled={submitting}>Submit</button>
            <button type="button" disabled={pristine || submitting} onClick={reset}>
              Clear Values
            </button>
          </div>
        </form>
      </div>
    );
  }
}

QuizForm = reduxForm({
  form: 'quizForm',
  validate
})(QuizForm);

const selector = formValueSelector('quizForm');

QuizForm = connect(
  state => {
    const questions = selector(state, 'questions');
    const questionType = questions && questions.map(question => question.questionType);

    return { questionType: questionType };
  }
)(QuizForm);

export default QuizForm;