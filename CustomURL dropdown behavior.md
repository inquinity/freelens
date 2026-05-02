CustomURL is blank, user clicks inside textbox; outcome is user has empty text edit box to type in.
CustomURL has value, user click inside textbox; outcome is that user is editing the existing text
User is editing text and leaves box; outcome is that validation is run
User is editing text and presses enter; outcome is that validation is run
Validation fails; outcome is that textbox shows an error.
Validation succeeds; outcome is that textbox shows normally (clear error state).
Validation requires https://URL where URL is a well formed URL.



Questions we need to discuss before the plan is complete:
- How are we indicating an error? Is there a standard behavior in the rest of the application?
- What happens if there is an invalid text and the user selects another dropdown option? What text do we have or do we revert to an empty string
- How are we validation the URL? Are we introducing a new library or re-using an existing one?
- How are we interacting wit hthe normal textbox "search" behavior. For example, if I open the textbox and start typing "de" this shows only options that start with "de", "Default" in this case. With the new behavior, what happens when I start typing "de", does it search, or am I entering a URL?