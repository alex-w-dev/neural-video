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
modelText2img = get_kandinsky2('cuda', task_type='text2img', model_version='2.2')

# path to the folder where the images will be saved
folder_path = 'C:/Kandinsky-2/imgs'

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
        originalH = int(args.get('h', 712))
        originalW = int(args.get('w', 712))
        isMobile = originalH != originalW

        for i in range(int(args.get('images_count', 1))):
            if isMobile:
                with torch.no_grad():
                    images = modelText2img.generate_text2img(
                        args.get('prompt', 'random beautiful thing, 4k'),
                        decoder_steps = int(args.get('decoder_steps', 50)),
                        batch_size = 1,
                        decoder_guidance_scale = float(args.get('guidance_scale', 7)),
                        h = min(originalW, originalH),
                        w = min(originalW, originalH),
                        prior_steps = int(args.get('prior_steps', 50)),
                        prior_guidance_scale = float(args.get('prior_cf_scale', 0.5)),
                        negative_prior_prompt = args.get('negative_prior_prompt', "low quality, bad quality"),
                        negative_decoder_prompt = args.get('negative_decoder_prompt', "low quality, bad quality")
                    )

                image = images[0]
                guid = uuid.uuid4()
                file_name = f"{guid}_{i}.png"
                file_path = os.path.join(folder_path, file_name)
                image.save(file_path)
                result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })
            else:
                with torch.no_grad():
                    images = modelText2img.generate_text2img(
                        args.get('prompt', 'random beautiful thing, 4k'),
                        decoder_steps = int(args.get('decoder_steps', 50)),
                        batch_size = 1,
                        decoder_guidance_scale = float(args.get('guidance_scale', 7)),
                        h = originalH,
                        w = originalW,
                        prior_steps = int(args.get('prior_steps', 50)),
                        prior_guidance_scale = float(args.get('prior_cf_scale', 0.5)),
                        negative_prior_prompt = args.get('negative_prior_prompt', "low quality, bad quality"),
                        negative_decoder_prompt = args.get('negative_decoder_prompt', "low quality, bad quality")
                    )

                image = images[0]
                guid = uuid.uuid4()
                file_name = f"{guid}_{i}.png"
                file_path = os.path.join(folder_path, file_name)
                image.save(file_path)
                result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })

        return result



api.add_resource(Quote, "/text2img", methods=['GET'])
if __name__ == '__main__':
    app.run(debug=True)

print("Server is ready!")