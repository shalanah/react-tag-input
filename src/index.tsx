import React from "react";
import {Tag} from "./components/Tag";
import {classSelectors} from "./utils/selectors";

type Tags = string[];

export interface ReactTagInputProps {
  tags: Tags;
  onChange: (tags: Tags) => void;
  placeholder?: string;
  maxTags?: number;
  validator?: (val: string) => boolean;
  editable?: boolean;
  readOnly?: boolean;
  removeOnBackspace?: boolean;
  separatorKeys?: Array<number>;
}

interface State {
  input: string;
}

export default class ReactTagInput extends React.Component<ReactTagInputProps, State> {

  state = { input: "" };

  // Ref for input element
  inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ input: e.target.value });
  }

   onBlur = () => {
    const { input } = this.state;
    const { validator } = this.props;

    // If input is blank, do nothing
    if (input === "") {
      return;
    }

    // Check if input is valid
    const valid = validator !== undefined ? validator(input) : true;
    if (!valid) {
      return;
    }

    // Add input to tag list
    this.addTag(input);
  };


  onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    const { input } = this.state;
    const { validator, removeOnBackspace, separatorKeys = [] } = this.props;

    // On enter or other separator keys
    if ([13, ...separatorKeys].includes(e.keyCode)) {

      // Prevent form submission if tag input is nested in <form>
      e.preventDefault();

      // If input is blank, do nothing
      if (input === "") { return; }

      // Check if input is valid
      const valid = validator !== undefined ? validator(input) : true;
      if (!valid) {
        return;
      }

      // Add input to tag list
      this.addTag(input);

    }
    // On backspace or delete
    else if (removeOnBackspace && (e.keyCode === 8 || e.keyCode === 46)) {

      // If currently typing, do nothing
      if (input !== "") {
        return;
      }

      // If input is blank, remove previous tag
      this.removeTag(this.props.tags.length - 1);

    }

  }

  addTag = (value: string) => {
    const tags = [ ...this.props.tags ];
    if (!tags.includes(value)) {
      tags.push(value);
      this.props.onChange(tags);
    }
    this.setState({ input: "" });
  }

  removeTag = (i: number) => {
    const tags = [ ...this.props.tags ];
    tags.splice(i, 1);
    this.props.onChange(tags);
  }

  updateTag = (i: number, value: string) => {
    const tags = [...this.props.tags];
    const numOccurencesOfValue = tags.reduce((prev, currentValue, index) => prev + (currentValue === value && index !== i ? 1 : 0) , 0);
    if (numOccurencesOfValue > 0) {
      tags.splice(i, 1);
    } else {
      tags[i] = value;
    }
    this.props.onChange(tags);
  }

  render() {

    const { input } = this.state;

    const { tags, placeholder, maxTags, editable, readOnly, validator, removeOnBackspace } = this.props;

    const maxTagsReached = maxTags !== undefined ? tags.length >= maxTags : false;

    const isEditable = readOnly ? false : (editable || false);

    const showInput = !readOnly && !maxTagsReached;

    return (
      <div className={classSelectors.wrapper}>
        {tags.map((tag, i) => (
          <Tag
            key={i}
            value={tag}
            index={i}
            editable={isEditable}
            readOnly={readOnly || false}
            inputRef={this.inputRef}
            update={this.updateTag}
            remove={this.removeTag}
            validator={validator}
            removeOnBackspace={removeOnBackspace}
          />
        ))}
        {showInput &&
          <input
            ref={this.inputRef}
            onBlur={this.onBlur}
            value={input}
            className={classSelectors.input}
            placeholder={placeholder || "Type and press enter"}
            onChange={this.onInputChange}
            onKeyDown={this.onInputKeyDown}
          />
        }
      </div>
    );

  }

}
