## css技巧

### 多行省略号
```css
{
    overflow:hidden;
    text-overflow:ellipsis;
    display:-webkit-box;
    -webkit-line-clamp:2; (两行文字)
    -webkit-box-orient:vertical;
}
```