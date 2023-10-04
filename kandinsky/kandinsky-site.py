import os
import uuid
from PIL import Image
from flask import Flask, send_file, request
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
import random
import torch
import gc

app = Flask(__name__)
api = Api(app)
CORS(app)

print('Import  kandinsky2 library...')
from kandinsky2 import get_kandinsky2

model = None
gc.collect()
torch.cuda.empty_cache()

print("Init model ...")
# model = get_kandinsky2('cuda', task_type='text2img', model_version='2.1', use_flash_attention=False)
model = get_kandinsky2('cuda', task_type='text2img', model_version='2.2')

# images = model.generate_text2img(
#     "beautiful slavic young woman in traditional russian outfit under sunbeams in a field with flowers, high quality, highly detailed, real photo, 8k",
#     num_steps=200,
#     batch_size=1,
#     guidance_scale=1,
#     h=600, w=450, # h=1024, w=712,
#     sampler='p_sampler',
#     prior_cf_scale=1,
#     prior_steps="5"
# )
#
# path to the folder where the images will be saved
folder_path = 'C:/Kandinsky-2/imgs'
# generate a unique identifier

# for i, image in enumerate(images):
#     # create the file name using the GUID, index, and the image file extension
#     file_name = f"{guid}_{i}.png"
#
#     # save the image to the folder with the GUID and index name
#     file_path = os.path.join(folder_path, file_name)
#     image.save(file_path)
#
# remaining_iterations = num_iterations - (iteration + 1)
# print(f"Completed iteration {iteration + 1}/{num_iterations}. {remaining_iterations} iteration(s) remaining.")

print("Init API ...")
@app.route('/ping')
def ping():
    return 'pong'

@app.route('/img/<file_name>')
def get_image(file_name):
    file_path = os.path.join(folder_path, file_name)
    return send_file(file_path)

class Quote(Resource):
    def get(self, id=0):
        gc.collect()
        torch.cuda.empty_cache()
        args = request.args

        result = []

        for i in range(int(args.get('images_count', 1))):
            with torch.no_grad():
                #  images = model.generate_text2img(
                #      args.get('prompt', 'random beautiful thing, 4k'),
                #      #num_steps=200,
                #      num_steps = int(args.get('num_steps', 100)),
                #      batch_size = int(args.get('batch_size', 1)),
                #      guidance_scale = int(args.get('guidance_scale', 7)),
                #      h = int(args.get('h', 712)),
                #      w = int(args.get('w', 712)),
                #      sampler = args.get('sampler', "ddim_sampler"),
                #      prior_cf_scale = int(args.get('prior_cf_scale', 4)),
                #      prior_steps =str(args.get('prior_steps', 25)),
                #      negative_prior_prompt = args.get('negative_prior_prompt', ""),
                #      negative_decoder_prompt = args.get('negative_decoder_prompt', "")
                #  )
                images = model.generate_text2img(
                    args.get('prompt', 'random beautiful thing, 4k'),
                    #num_steps=200,
                    #num_steps = int(args.get('num_steps', 100)),
                    decoder_steps = int(args.get('decoder_steps', 50)),
                    batch_size = 1,
                    decoder_guidance_scale = float(args.get('guidance_scale', 4)),
                    h = int(args.get('h', 712)),
                    w = int(args.get('w', 712)),
                    prior_steps = int(args.get('prior_steps', 25)),
                    prior_guidance_scale = float(args.get('prior_cf_scale', 4)),
                    negative_prior_prompt = args.get('negative_prior_prompt', "low quality, bad quality"),
                    negative_decoder_prompt = args.get('negative_decoder_prompt', "low quality, bad quality")
                )


            for i, image in enumerate(images):
                # create the file name using the GUID, index, and the image file extension
                guid = uuid.uuid4()
                file_name = f"{guid}_{i}.png"

                # save the image to the folder with the GUID and index name
                file_path = os.path.join(folder_path, file_name)
                image.save(file_path)
                result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })

            # return send_file(file_path, mimetype='image/png')

        return result



api.add_resource(Quote, "/text2img", methods=['GET'])
if __name__ == '__main__':
    app.run(debug=True)

print("Server is ready!")