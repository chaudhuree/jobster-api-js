#### ERROR HANDLING IN USER UPDATE

- this.modifiedPaths();

```js
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // ◀ ◀ if password is not modified, return
  //but if password is modified, then hash it 🔽🔽
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```
