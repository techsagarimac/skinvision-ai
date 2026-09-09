# Privacy considerations

SkinVision AI is designed as a local visual-analysis tool.

## Images

- Analyzed only for the request the user initiates
- Not written to the database by default
- Held in memory (and short-lived decode buffers) during analysis
- Not sent to third-party APIs unless an operator later configures that

## Identity

- Face landmarks are used to estimate regions
- Face recognition is not implemented
- Identity is not inferred or stored

## Optional history

Users may save numeric statistics:

- visible spot count
- region totals
- image quality label
- detection mode
- timestamp

Those records can be deleted from `/history`.

## Operator duties

If you deploy this software, publish your own retention policy, restrict CORS
to your frontend origin, and keep `APP_ENV` and secrets in environment
variables.
