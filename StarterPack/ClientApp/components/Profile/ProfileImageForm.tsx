import * as React from 'react';
import { Field, reduxForm, GenericField } from 'redux-form';
import { Link } from 'react-router-dom';
import renderFileInput from '../../controls/RenderFileInput';

const DropDownMenu = Field as new () => GenericField<any>;
const InputField = Field as new () => GenericField<any>;

interface DropDownProps {
    options: any;
    id: string; 
    placeholder: string; 
    className: string;
    required: boolean
}

class DropDown extends Field<DropDownProps> { }

const profileForm = ({ pristine, submitting, handleSubmit, ...props }) => {
    return (<form id="profileForm" className='form-wrapper' onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="imageUrl" className="form-control-label">Image Url</label>
            <InputField type="file" name="imageUrl" id="imageUrl" placeholder="Image Url" component={renderFileInput} className="form-control" />
        </div>
        <div className="form-group">
            <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={pristine || submitting}>Save Profile</button>
        </div>
    </form>);
}

export default reduxForm<{}, {}>({
    form: 'profileForm',
    destroyOnUnmount: false, //        <------ preserve form data
    forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
})(profileForm);