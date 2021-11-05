# Targets

[https://rustwasm.github.io/wasm-pack/book/commands/build.html#target](https://rustwasm.github.io/wasm-pack/book/commands/build.html#target)

```bash
wasm-pack build --target web
```

`wasm-pack build --target bundler` doesn't seem to work outside webpack, since there's a plugin for only webpack.

```js
import init from "../../../rust-projects/transform_recryption/wasm-code/pkg"

init().then((exports) => {
    exports.greet()
})
```

## License

MIT+CC "Commons Clause" License Condition
