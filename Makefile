.PHONY: demo demo-build version publish

## demoサーバーを起動 (vite dev server)
demo:
	cd demo-react && npm run dev

## demoをビルド
demo-build:
	cd demo-react && npm run build

## 現在のバージョンを表示
version:
	@echo "wasm:  $$(node -p "require('./packages/wasm/package.json').version")"
	@echo "react: $$(node -p "require('./packages/react/package.json').version")"

## NPMパッケージを公開 (usage: make publish OTP=123456 BUMP=patch)
## BUMP: patch | minor | major
publish:
ifndef OTP
	$(error OTP is required. Usage: make publish OTP=123456 BUMP=patch)
endif
ifndef BUMP
	$(error BUMP is required. Usage: make publish OTP=123456 BUMP=patch)
endif
	@echo "=== Current versions ==="
	@echo "wasm:  $$(node -p "require('./packages/wasm/package.json').version")"
	@echo "react: $$(node -p "require('./packages/react/package.json').version")"
	@echo ""
	cd packages/wasm && npm version $(BUMP) --no-git-tag-version
	cd packages/react && npm version $(BUMP) --no-git-tag-version
	@echo ""
	@echo "=== New versions ==="
	@echo "wasm:  $$(node -p "require('./packages/wasm/package.json').version")"
	@echo "react: $$(node -p "require('./packages/react/package.json').version")"
	@echo ""
	@echo "=== Publishing (pack + publish to avoid pnpm/npm arborist conflict) ==="
	cd packages/wasm && npm pack && npm publish gospelo-iconcraft-wasm-$$(node -p "require('./package.json').version").tgz --otp=$(OTP) && rm -f *.tgz
	cd packages/react && npm pack && npm publish gospelo-iconcraft-react-$$(node -p "require('./package.json').version").tgz --otp=$(OTP) && rm -f *.tgz
	@echo ""
	@echo "=== Done ==="
