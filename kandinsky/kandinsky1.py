from kandinsky2 import get_kandinsky2
model = get_kandinsky2('cuda', task_type='text2img', model_version='2.2')
images = model.generate_text2img(
    "red cat, 4k photo",
    decoder_steps=50,
    batch_size=1,
    h=624,
    w=468,
)
print(111)