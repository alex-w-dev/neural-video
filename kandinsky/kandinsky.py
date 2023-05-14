import os
import uuid
from PIL import Image

from kandinsky2 import get_kandinsky2
model = get_kandinsky2('cuda', task_type='text2img', model_version='2.1', use_flash_attention=False)
print(111)
images = model.generate_text2img(
    "beautiful slavic young woman in traditional russian outfit under sunbeams in a field with flowers, high quality, highly detailed, real photo, 8k",
    num_steps=200,
    batch_size=1,
    guidance_scale=1,
    h=600, w=450, # h=1024, w=712,
    sampler='p_sampler',
    prior_cf_scale=1,
    prior_steps="5"
)

# path to the folder where the images will be saved
folder_path = 'C:/Kandinsky-2/imgs'
# generate a unique identifier
guid = uuid.uuid4()

for i, image in enumerate(images):
    # create the file name using the GUID, index, and the image file extension
    file_name = f"{guid}_{i}.png"

    # save the image to the folder with the GUID and index name
    file_path = os.path.join(folder_path, file_name)
    image.save(file_path)

remaining_iterations = num_iterations - (iteration + 1)
print(f"Completed iteration {iteration + 1}/{num_iterations}. {remaining_iterations} iteration(s) remaining.")

class Quote(Resource):
    def get(self, id=0):
        if id == 0:
            return random.choice(ai_quotes), 200
        for quote in ai_quotes:
            if(quote["id"] == id):
                return quote, 200
        return "Quote not found", 404



api.add_resource(Quote, "/ai-quotes", "/ai-quotes/", "/ai-quotes/<int:id>")
if __name__ == '__main__':
    app.run(debug=True)